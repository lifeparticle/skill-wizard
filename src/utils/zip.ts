export interface ZipEntry {
  filename: string;
  content: string | Uint8Array;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    header: Uint8Array;
    data: Uint8Array;
    centralHeader: Uint8Array;
    offset: number;
  }[] = [];

  let currentOffset = 0;

  for (const entry of entries) {
    const data = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
    const nameBytes = encoder.encode(entry.filename);
    const checksum = crc32(data);
    const size = data.length;

    // Local file header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true); // Version needed to extract (2.0)
    view.setUint16(6, 0x0800, true); // General purpose bit flag (UTF-8 filename)
    view.setUint16(8, 0, true); // Compression method (0 = store)
    view.setUint16(10, 0, true); // Last mod file time
    view.setUint16(12, 0, true); // Last mod file date
    view.setUint32(14, checksum, true); // CRC-32
    view.setUint32(18, size, true); // Compressed size
    view.setUint32(22, size, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    // Central directory header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cView = new DataView(centralHeader.buffer);

    cView.setUint32(0, 0x02014b50, true); // Central directory file header signature
    cView.setUint16(4, 20, true); // Version made by
    cView.setUint16(6, 20, true); // Version needed to extract
    cView.setUint16(8, 0x0800, true); // General purpose bit flag
    cView.setUint16(10, 0, true); // Compression method
    cView.setUint16(12, 0, true); // Mod time
    cView.setUint16(14, 0, true); // Mod date
    cView.setUint32(16, checksum, true); // CRC-32
    cView.setUint32(20, size, true); // Compressed size
    cView.setUint32(24, size, true); // Uncompressed size
    cView.setUint16(28, nameBytes.length, true); // Filename length
    cView.setUint16(30, 0, true); // Extra field length
    cView.setUint16(32, 0, true); // File comment length
    cView.setUint16(34, 0, true); // Disk number start
    cView.setUint16(36, 0, true); // Internal file attributes
    cView.setUint32(38, 0, true); // External file attributes
    cView.setUint32(42, currentOffset, true); // Relative offset of local header
    centralHeader.set(nameBytes, 46);

    fileRecords.push({
      header: localHeader,
      data,
      centralHeader,
      offset: currentOffset,
    });

    currentOffset += localHeader.length + data.length;
  }

  const centralDirOffset = currentOffset;
  let centralDirSize = 0;
  for (const r of fileRecords) {
    centralDirSize += r.centralHeader.length;
  }

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eView = new DataView(eocd.buffer);
  eView.setUint32(0, 0x06054b50, true); // EOCD signature
  eView.setUint16(4, 0, true); // Number of this disk
  eView.setUint16(6, 0, true); // Disk where central directory starts
  eView.setUint16(8, entries.length, true); // Total entries on this disk
  eView.setUint16(10, entries.length, true); // Total entries in central directory
  eView.setUint32(12, centralDirSize, true); // Size of central directory
  eView.setUint32(16, centralDirOffset, true); // Offset of start of central directory
  eView.setUint16(20, 0, true); // Comment length

  const chunks: BlobPart[] = [];
  for (const r of fileRecords) {
    chunks.push(r.header as unknown as BlobPart);
    chunks.push(r.data as unknown as BlobPart);
  }
  for (const r of fileRecords) {
    chunks.push(r.centralHeader as unknown as BlobPart);
  }
  chunks.push(eocd as unknown as BlobPart);

  return new Blob(chunks, { type: 'application/zip' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
