import html2canvas from 'html2canvas';

export function captureHighResScreenshot() {
  const element = document.querySelector('#capture-target');
  
  html2canvas(element, {
    scale: 4, // 4K resolution multiplier
    useCORS: true,
    allowTaint: true,
    logging: false
  }).then(canvas => {
    // Download the image
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'high-resolution-screenshot.png';
    link.click();
  });
}