import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
    title: string;
    description: string;
    url?: string;
    image?: string;
}

export const MetaTags = ({ title, description, url, image }: MetaTagsProps) => {
    const siteTitle = `${title}`;
    return (
        <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            {url && <meta property="og:url" content={url} />}
            {image && <meta property="og:image" content={image} />}
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
    );
};
