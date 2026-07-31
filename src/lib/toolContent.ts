// Level 3 SEO: on-page content (how-to + FAQ) for each tool. Keyed by route path.
// The same data feeds the visible <ToolContent> and the FAQPage structured data in seo.ts,
// so the page copy and the schema always match.
export interface ToolContentData {
  about: string;
  steps: { name: string; text: string }[];
  faq: { q: string; a: string }[];
}

export const TOOL_CONTENT: Record<string, ToolContentData> = {
  '/compress': {
    about:
      'Compressing images makes web pages load faster and saves storage, with little visible quality loss when you pick the right format and quality level.',
    steps: [
      { name: 'Add your images', text: 'Drop JPEG, PNG, WebP, AVIF or HEIC files onto the upload box. Everything stays on your device.' },
      { name: 'Pick a format and quality', text: 'Choose WebP or AVIF for the smallest files, then set the quality slider.' },
      { name: 'Download', text: 'Click Compress and download each image, or all of them as a ZIP.' },
    ],
    faq: [
      { q: 'How much smaller will my images get?', a: 'WebP and AVIF usually cut file size by 60 to 90 percent versus the original JPEG or PNG, with little visible difference.' },
      { q: 'Will compressing reduce quality?', a: 'You control the quality slider. Higher keeps more detail, lower makes smaller files, and nothing is ever watermarked.' },
      { q: 'Are my images uploaded?', a: 'No. Compression runs entirely in your browser, so your images never leave your device.' },
    ],
  },
  '/convert': {
    about:
      'Converting between formats lets you open files anywhere and pick the best trade-off between size and quality for each use.',
    steps: [
      { name: 'Add your images', text: 'Drop JPEG, PNG, WebP, AVIF or HEIC files. HEIC photos from an iPhone are supported.' },
      { name: 'Choose the target format', text: 'Pick JPEG, PNG, WebP or AVIF, and set the quality for lossy formats.' },
      { name: 'Download', text: 'Click Convert and download each file, or all of them as a ZIP.' },
    ],
    faq: [
      { q: 'Can I convert HEIC to JPG?', a: 'Yes. Drop your iPhone HEIC photos and convert them to JPG, PNG, WebP or AVIF in one click.' },
      { q: 'Which format should I choose?', a: 'WebP and AVIF give the smallest files for the web, JPG is the most compatible, and PNG keeps transparency.' },
      { q: 'Is there a file limit?', a: 'No. Convert as many files as you like; everything runs locally in your browser.' },
    ],
  },
  '/resize': {
    about:
      'Resizing reduces the pixel dimensions of an image, which is useful for uploads, thumbnails and meeting exact size requirements.',
    steps: [
      { name: 'Add your images', text: 'Drop the images you want to resize.' },
      { name: 'Choose a size', text: 'Resize by long edge, percentage, or exact width and height. Keep aspect ratio to avoid stretching.' },
      { name: 'Download', text: 'Click Resize and download your images.' },
    ],
    faq: [
      { q: 'Will resizing crop my image?', a: 'No. Resizing scales the whole image. Use the Crop tool if you want to cut part of it.' },
      { q: 'Can I enlarge images?', a: 'Yes, though for large enlargements the Upscale tool gives sharper results.' },
      { q: 'Are my images uploaded?', a: 'No, resizing happens entirely on your device.' },
    ],
  },
  '/strip-metadata': {
    about:
      'Photos carry hidden EXIF metadata such as GPS location, camera model and timestamps. Removing it protects your privacy before you share online.',
    steps: [
      { name: 'Add your photos', text: 'Drop the photos you want to clean. They are scanned on-device to show what will be removed.' },
      { name: 'Review detected data', text: 'See any GPS location, camera or timestamp data found in your files.' },
      { name: 'Download clean copies', text: 'Click Clean metadata to download copies with the metadata stripped out.' },
    ],
    faq: [
      { q: 'What metadata is removed?', a: 'Re-encoding removes EXIF, GPS location, camera make and model, and timestamps.' },
      { q: 'Does it change how the photo looks?', a: 'No. Only the hidden metadata is removed; the image itself is preserved.' },
      { q: 'Is anything uploaded?', a: 'No. Scanning and cleaning happen entirely in your browser.' },
    ],
  },
  '/upscale': {
    about:
      'Upscaling increases the pixel dimensions of an image. This tool uses high-quality resampling plus sharpening to enlarge photos and graphics.',
    steps: [
      { name: 'Add your images', text: 'Drop the images you want to enlarge.' },
      { name: 'Choose a scale', text: 'Pick 2x or 4x, and keep sharpening on for crisper edges.' },
      { name: 'Download', text: 'Click Upscale and download the larger images.' },
    ],
    faq: [
      { q: 'Does it add detail like AI super-resolution?', a: 'It uses high-quality resampling and sharpening, which enlarges cleanly but does not invent new detail like a heavy AI model would.' },
      { q: 'What is the best format for upscaled images?', a: 'PNG keeps maximum quality, while WebP or JPG make smaller files.' },
      { q: 'Are my images uploaded?', a: 'No, upscaling runs entirely on your device.' },
    ],
  },
  '/crop': {
    about:
      'Cropping removes the parts of an image you do not want and can set a specific aspect ratio for social posts, thumbnails or prints.',
    steps: [
      { name: 'Add an image', text: 'Drop or select the image you want to crop.' },
      { name: 'Set the crop', text: 'Drag the selection box, or pick an aspect ratio like 1:1 or 16:9.' },
      { name: 'Download', text: 'Choose a format and download your cropped image.' },
    ],
    faq: [
      { q: 'Does cropping lose quality?', a: 'No. The crop is taken from the full-resolution original with no extra compression beyond the format you choose.' },
      { q: 'Can I crop to a square for Instagram?', a: 'Yes, pick the 1:1 aspect ratio.' },
      { q: 'Is my image uploaded?', a: 'No, cropping happens entirely in your browser.' },
    ],
  },
  '/favicon': {
    about:
      'A favicon is the small icon shown in browser tabs and bookmarks. Modern sites also need larger app icons and a web manifest.',
    steps: [
      { name: 'Add a square image', text: 'Drop a logo or image; a square PNG works best.' },
      { name: 'Every size is generated', text: 'You get favicon.ico, PNGs from 16 to 512 pixels, an apple-touch-icon and a web manifest.' },
      { name: 'Download the ZIP', text: 'Download favicons.zip and add the included HTML snippet to your site.' },
    ],
    faq: [
      { q: 'What files do I get?', a: 'A favicon.ico, PNG icons from 16 to 512 pixels, an apple-touch-icon, a site.webmanifest and an HTML snippet.' },
      { q: 'Where do I put them?', a: 'Upload the files to your site root and paste the HTML snippet into the head of your pages.' },
      { q: 'Is my image uploaded?', a: 'No, all icons are generated in your browser.' },
    ],
  },
  '/passport-photo': {
    about:
      'Passport and ID photos must match official dimensions and print resolution. This tool crops to the correct aspect ratio and exports the exact pixel size.',
    steps: [
      { name: 'Add your photo', text: 'Drop a clear, front-facing photo.' },
      { name: 'Pick a size', text: 'Choose your country size, such as US 2x2 inch or UK and EU 35x45mm, and the print DPI.' },
      { name: 'Download', text: 'Download a print-ready JPEG at the exact pixel dimensions.' },
    ],
    faq: [
      { q: 'Which sizes are supported?', a: 'US 2x2 inch, UK, EU and Schengen 35x45mm, plus India, China, Canada and Australia.' },
      { q: 'What DPI should I use?', a: '300 DPI is standard for printing; 600 DPI gives higher quality.' },
      { q: 'Is my photo uploaded?', a: 'No, the crop and export happen entirely on your device.' },
    ],
  },
  '/background-remover': {
    about:
      'Removing the background isolates the subject of a photo, giving you a transparent PNG for product shots, profile pictures and design work.',
    steps: [
      { name: 'Add an image', text: 'Drop a photo with a clear subject.' },
      { name: 'Remove the background', text: 'The on-device AI model runs in your browser and creates a transparent cutout.' },
      { name: 'Download', text: 'Keep it transparent or add a solid colour, then download the PNG.' },
    ],
    faq: [
      { q: 'Is the image uploaded to remove the background?', a: 'No. The AI model downloads once, then runs entirely in your browser. Your image is never uploaded.' },
      { q: 'Why does the first run take longer?', a: 'The AI model downloads on first use, then it is cached for instant, offline runs.' },
      { q: 'What do I get?', a: 'A full-resolution PNG with a transparent background, or your chosen solid colour.' },
    ],
  },
  '/rotate': {
    about:
      'Rotating fixes photos taken at the wrong orientation, and flipping mirrors an image. Both are lossless aside from the output format you export to.',
    steps: [
      { name: 'Add your images', text: 'Drop the images you want to rotate or flip.' },
      { name: 'Choose rotation and flips', text: 'Rotate left or right in 90 degree steps, and flip horizontally or vertically.' },
      { name: 'Apply and download', text: 'Click Apply and download each image, or all of them as a ZIP.' },
    ],
    faq: [
      { q: 'Does rotating reduce quality?', a: 'Rotating by 90, 180 or 270 degrees is lossless; any change comes only from the output format and quality you pick.' },
      { q: 'Can I rotate many photos at once?', a: 'Yes. Drop a batch and the same rotation and flip settings apply to all of them.' },
      { q: 'Are my images uploaded?', a: 'No, rotating and flipping happen entirely on your device.' },
    ],
  },
  '/image-to-pdf': {
    about:
      'Turning images into a PDF is handy for sharing scans, receipts, portfolios or multi-page documents as one file that opens everywhere.',
    steps: [
      { name: 'Add your images', text: 'Drop JPG, PNG, WebP, AVIF or HEIC images in the order you want the pages.' },
      { name: 'Choose page settings', text: 'Pick A4, US Letter or fit-to-image, and portrait or landscape.' },
      { name: 'Create and download', text: 'Click Create PDF and download your combined document.' },
    ],
    faq: [
      { q: 'Can I combine many images into one PDF?', a: 'Yes. Every image you drop becomes one page, in the order you added them.' },
      { q: 'Which image formats work?', a: 'JPG, PNG, WebP, AVIF and HEIC. HEIC photos from an iPhone are supported too.' },
      { q: 'Is my document uploaded?', a: 'No. The PDF is built entirely in your browser and never leaves your device.' },
    ],
  },
};
