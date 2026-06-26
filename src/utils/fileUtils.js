export function saveBlob(blob, filename = "download.pdf") {
  let finalName = filename;
  
  // Ensure correct file extension matching the Blob type
  if (blob.type === 'application/pdf' && !finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
  } else if (blob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && !finalName.toLowerCase().endsWith('.docx')) {
      finalName += '.docx';
  } else if (blob.type === 'application/msword' && !finalName.toLowerCase().endsWith('.doc')) {
      finalName += '.doc';
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}
