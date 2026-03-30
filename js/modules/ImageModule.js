export const createLazyImage = (imageSources, altText = "Изображение поста") => {
    if (!imageSources) return null;

    const picture = document.createElement('picture');
    picture.className = 'post-image-container';

    if (imageSources.avif) {
        const sourceAvif = document.createElement('source');
        sourceAvif.srcset = imageSources.avif;
        sourceAvif.type = "image/avif";
        picture.appendChild(sourceAvif);
    }

    if (imageSources.webp) {
        const sourceWebp = document.createElement('source');
        sourceWebp.srcset = imageSources.webp;
        sourceWebp.type = "image/webp";
        picture.appendChild(sourceWebp);
    }

    const img = document.createElement('img');
    img.src = imageSources.fallback;
    img.alt = altText;
    img.loading = "lazy";
    img.className = "post-img-content";

    img.onload = () => img.classList.add('loaded');

    picture.appendChild(img);
    return picture;
};