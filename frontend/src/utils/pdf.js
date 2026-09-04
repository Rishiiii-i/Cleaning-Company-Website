export function downloadPdf(type) {
  const isPrivacy = type === 'privacy';
  const fileName = isPrivacy ? 'privacy-policy.pdf' : 'terms-and-conditions.pdf';
  const filePath = isPrivacy ? '/privacy.pdf' : '/terms.pdf';

  const link = document.createElement('a');
  link.href = filePath;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default downloadPdf;
