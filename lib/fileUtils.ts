function formatBytes(bytes: number): string {
  const kb = 1024;
  const mb = kb * 1024;

  if (bytes >= mb) {
    return `${(bytes / mb).toFixed(2)} MB`;
  }
  if (bytes >= kb) {
    return `${(bytes / kb).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

export { formatBytes };
