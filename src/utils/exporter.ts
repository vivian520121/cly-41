export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const downloadSVG = (svgCode: string, filename: string = 'loader.svg'): void => {
  const blob = new Blob([svgCode], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const camelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

export const svgToReactComponent = (svgCode: string, componentName: string = 'Loader'): string => {
  let reactCode = svgCode;
  
  reactCode = reactCode.replace(/class=/g, 'className=');
  reactCode = reactCode.replace(/stroke-width=/g, 'strokeWidth=');
  reactCode = reactCode.replace(/stroke-linecap=/g, 'strokeLinecap=');
  reactCode = reactCode.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  reactCode = reactCode.replace(/fill-rule=/g, 'fillRule=');
  reactCode = reactCode.replace(/clip-rule=/g, 'clipRule=');
  reactCode = reactCode.replace(/font-family=/g, 'fontFamily=');
  reactCode = reactCode.replace(/font-size=/g, 'fontSize=');
  reactCode = reactCode.replace(/text-anchor=/g, 'textAnchor=');
  reactCode = reactCode.replace(/stop-color=/g, 'stopColor=');
  reactCode = reactCode.replace(/stop-opacity=/g, 'stopOpacity=');
  reactCode = reactCode.replace(/xmlns:xlink/g, 'xmlnsXlink');
  reactCode = reactCode.replace(/xlink:href/g, 'xlinkHref');
  reactCode = reactCode.replace(/preserveAspectRatio=/g, 'preserveAspectRatio=');
  reactCode = reactCode.replace(/viewBox=/g, 'viewBox=');
  
  const attributes = reactCode.match(/<svg([^>]+)>/);
  if (attributes) {
    let svgAttrs = attributes[1];
    svgAttrs = svgAttrs.replace(/([a-z]+)-([a-z]+)=/g, (match, p1, p2) => `${p1}${p2.charAt(0).toUpperCase() + p2.slice(1)}=`);
    reactCode = reactCode.replace(/<svg[^>]+>/, `<svg${svgAttrs}>`);
  }
  
  return `import React from 'react';

const ${componentName}: React.FC = () => {
  return (
    ${reactCode}
  );
};

export default ${componentName};
`;
};
