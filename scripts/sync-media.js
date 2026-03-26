const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting media sync...');
  
  // Get all unique image URLs from ProductImage
  const productImages = await prisma.productImage.findMany({
    select: { url: true },
    distinct: ['url']
  });
  
  // Get all unique image URLs from Category
  const categories = await prisma.category.findMany({
    where: { image: { not: null } },
    select: { image: true, createdAt: true }
  });

  const allUrls = new Map();
  
  for (const img of productImages) {
    if (img.url && !allUrls.has(img.url)) {
      allUrls.set(img.url, img.createdAt);
    }
  }
  
  for (const cat of categories) {
    if (cat.image && !allUrls.has(cat.image)) {
      allUrls.set(cat.image, cat.createdAt);
    }
  }

  console.log(`Found ${allUrls.size} unique URLs.`);

  let added = 0;
  for (const [url, createdAt] of allUrls.entries()) {
    // Check if it already exists in Media
    const existing = await prisma.media.findUnique({
      where: { url }
    });
    
    if (!existing) {
      // Extract public_id if it's a Cloudinary URL
      // https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/public_id.jpg
      let publicId = null;
      let format = null;
      
      try {
        if (url.includes('res.cloudinary.com')) {
          const parts = url.split('/upload/');
          if (parts.length > 1) {
            let path = parts[1]; // e.g. v1700000/socrati_uploads/image.jpg
            path = path.replace(/^v\d+\//, ''); // remove version
            
            const lastDotIndex = path.lastIndexOf('.');
            if (lastDotIndex !== -1) {
              format = path.substring(lastDotIndex + 1);
              publicId = path.substring(0, lastDotIndex);
            } else {
              publicId = path;
            }
          }
        } else {
            // For example, /images/socratilogoblack.png
            const lastDotIndex = url.lastIndexOf('.');
            if (lastDotIndex !== -1) {
              format = url.substring(lastDotIndex + 1);
              publicId = url; // or null
            }
        }
      } catch (e) {}

      await prisma.media.create({
        data: {
          url,
          publicId,
          format: format || 'jpg',
          bytes: null, // Since we don't know the file size
          createdAt: createdAt || new Date()
        }
      });
      added++;
    }
  }

  console.log(`Successfully added ${added} new media records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
