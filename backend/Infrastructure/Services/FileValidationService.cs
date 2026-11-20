namespace Infrastructure.Services;

public sealed class FileValidationService(IOptions<StorageOptions> options) : IFileValidationService
{
    private readonly StorageOptions _options = options.Value;

    private static readonly Dictionary<string, string> CanonicalMimeTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "application/pdf",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".webp"] = "image/webp",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

    private static readonly HashSet<string> DangerousMimeTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "text/html",
            "application/javascript",
            "text/javascript",
            "application/x-javascript",
            "text/ecmascript",
            "application/x-msdownload",
            "application/x-sh",
            "application/x-csh",
            "application/x-bat",
            "application/x-executable",
            "application/octet-stream"
        };

    private static readonly Dictionary<string, Func<byte[], int, bool>> SignatureValidators =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = (bytes, count) => count >= 4 &&
                bytes[0] == 0x25 && bytes[1] == 0x50 && bytes[2] == 0x44 && bytes[3] == 0x46,

            [".jpg"] = (bytes, count) => count >= 3 &&
                bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,

            [".jpeg"] = (bytes, count) => count >= 3 &&
                bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,

            [".png"] = (bytes, count) => count >= 8 &&
                bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 &&
                bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A,

            [".webp"] = (bytes, count) => count >= 12 &&
                bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
                bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50,

            [".docx"] = (bytes, count) => count >= 4 &&
                bytes[0] == 0x50 && bytes[1] == 0x4B && bytes[2] == 0x03 && bytes[3] == 0x04,

            [".xlsx"] = (bytes, count) => count >= 4 &&
                bytes[0] == 0x50 && bytes[1] == 0x4B && bytes[2] == 0x03 && bytes[3] == 0x04
        };

    public async Task<string> ValidateFileStreamAsync(
        string fileName,
        Stream content,
        long length,
        string? clientContentType = null,
        CancellationToken cancellationToken = default)
    {
        if (length <= 0)
        {
            throw new InvalidOperationException($"File '{fileName}' is empty.");
        }

        if (length > _options.MaxFileSizeBytes)
        {
            throw new InvalidOperationException(
                $"File '{fileName}' exceeds the maximum allowed size of {_options.MaxFileSizeBytes} bytes.");
        }

        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            throw new InvalidOperationException($"File '{fileName}' does not have a valid extension.");
        }

        var isAllowedExtension = _options.AllowedExtensions
            .Any(allowed => string.Equals(allowed, extension, StringComparison.OrdinalIgnoreCase));

        if (!isAllowedExtension)
        {
            throw new InvalidOperationException(
                $"File extension '{extension}' is not permitted. Allowed extensions: {string.Join(", ", _options.AllowedExtensions)}.");
        }

        if (!string.IsNullOrWhiteSpace(clientContentType))
        {
            var trimmedContentType = clientContentType.Split(';')[0].Trim();
            if (DangerousMimeTypes.Contains(trimmedContentType))
            {
                throw new InvalidOperationException(
                    $"Client Content-Type '{trimmedContentType}' is rejected as potentially unsafe for file '{fileName}'.");
            }
        }

        if (!SignatureValidators.TryGetValue(extension, out var validator))
        {
            throw new InvalidOperationException(
                $"Security policy rejected file '{fileName}': no signature validator is configured for extension '{extension}'.");
        }

        if (!CanonicalMimeTypes.TryGetValue(extension, out var canonicalMimeType))
        {
            throw new InvalidOperationException(
                $"No canonical MIME type is mapped for extension '{extension}'.");
        }

        var initialPosition = content.CanSeek ? content.Position : 0;
        var header = new byte[16];
        var bytesRead = await ReadExactBytesAsync(content, header, cancellationToken);

        if (content.CanSeek)
        {
            content.Position = initialPosition;
        }

        if (!validator(header, bytesRead))
        {
            throw new InvalidOperationException(
                $"File content signature mismatch for '{fileName}'. The binary header does not match extension '{extension}'.");
        }

        if (string.Equals(extension, ".docx", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(extension, ".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            ValidateOpenXmlPackage(content, extension);

            if (content.CanSeek)
            {
                content.Position = initialPosition;
            }
        }

        return canonicalMimeType;
    }

    public string GetCanonicalMimeType(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        if (!string.IsNullOrWhiteSpace(extension) &&
            CanonicalMimeTypes.TryGetValue(extension, out var canonical))
        {
            return canonical;
        }

        return "application/octet-stream";
    }

    private static void ValidateOpenXmlPackage(Stream stream, string extension)
    {
        try
        {
            using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: true);

            const int maxEntries = 500;
            if (archive.Entries.Count > maxEntries)
            {
                throw new InvalidOperationException(
                    $"OpenXML package exceeds maximum allowed entries limit ({maxEntries}).");
            }

            const long maxUncompressedBytes = 50 * 1024 * 1024;
            long totalUncompressedBytes = 0;
            foreach (var entry in archive.Entries)
            {
                totalUncompressedBytes += entry.Length;
                if (totalUncompressedBytes > maxUncompressedBytes)
                {
                    throw new InvalidOperationException(
                        "OpenXML package exceeds maximum allowed uncompressed size.");
                }
            }

            var hasContentTypes = archive.Entries.Any(e =>
                string.Equals(e.FullName, "[Content_Types].xml", StringComparison.OrdinalIgnoreCase));

            if (!hasContentTypes)
            {
                throw new InvalidOperationException(
                    "Invalid OpenXML package: missing '[Content_Types].xml'. Generic ZIP archives are rejected.");
            }

            if (string.Equals(extension, ".docx", StringComparison.OrdinalIgnoreCase))
            {
                var hasWordDocument = archive.Entries.Any(e =>
                    string.Equals(e.FullName, "word/document.xml", StringComparison.OrdinalIgnoreCase));

                if (!hasWordDocument)
                {
                    throw new InvalidOperationException(
                        "Invalid Word document package: missing 'word/document.xml'.");
                }
            }
            else if (string.Equals(extension, ".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                var hasWorkbook = archive.Entries.Any(e =>
                    string.Equals(e.FullName, "xl/workbook.xml", StringComparison.OrdinalIgnoreCase));

                if (!hasWorkbook)
                {
                    throw new InvalidOperationException(
                        "Invalid Excel workbook package: missing 'xl/workbook.xml'.");
                }
            }
        }
        catch (InvalidDataException ex)
        {
            throw new InvalidOperationException(
                "Corrupt or invalid OpenXML archive package.", ex);
        }
    }

    private static async Task<int> ReadExactBytesAsync(Stream stream, byte[] buffer, CancellationToken cancellationToken)
    {
        var totalRead = 0;
        while (totalRead < buffer.Length)
        {
            var read = await stream.ReadAsync(buffer.AsMemory(totalRead, buffer.Length - totalRead), cancellationToken);
            if (read == 0)
            {
                break;
            }

            totalRead += read;
        }

        return totalRead;
    }
}
