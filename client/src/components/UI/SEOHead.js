import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  children
}) => {
  const siteName = 'Streamora - Free Movie & TV Streaming';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  
  const defaultDescription = 'Watch free movies, TV shows, and live radio stations on Streamora. No subscription required. Stream thousands of titles in HD quality.';
  const metaDescription = description || defaultDescription;
  
  const defaultImage = '/images/og-image.jpg';
  const ogImage = image || defaultImage;
  
  const canonicalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Streamora" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@streamora" />
      <meta name="twitter:creator" content="@streamora" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Structured Data for Movies/TV Shows */}
      {type === 'video.movie' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": title,
            "description": metaDescription,
            "image": ogImage,
            "url": canonicalUrl,
            "provider": {
              "@type": "Organization",
              "name": "Streamora",
              "url": "https://streamora.com"
            },
            "potentialAction": {
              "@type": "WatchAction",
              "target": canonicalUrl
            }
          })}
        </script>
      )}
      
      {type === 'video.tv_show' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVSeries",
            "name": title,
            "description": metaDescription,
            "image": ogImage,
            "url": canonicalUrl,
            "provider": {
              "@type": "Organization",
              "name": "Streamora",
              "url": "https://streamora.com"
            },
            "potentialAction": {
              "@type": "WatchAction",
              "target": canonicalUrl
            }
          })}
        </script>
      )}
      
      {/* Website Structured Data */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "description": metaDescription,
            "url": "https://streamora.com",
            "image": ogImage,
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://streamora.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Streamora",
              "url": "https://streamora.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://streamora.com/images/logo.png"
              }
            }
          })}
        </script>
      )}
      
      {/* Preload Critical Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Additional custom meta tags */}
      {children}
    </Helmet>
  );
};

// Helper components for specific page types
export const MovieSEO = ({ movie, ...props }) => (
  <SEOHead
    title={movie.title}
    description={`Watch ${movie.title} (${movie.year}) free online. ${movie.overview}`}
    keywords={`${movie.title}, ${movie.year}, movie, free streaming, watch online`}
    image={movie.poster}
    type="video.movie"
    {...props}
  />
);

export const TVShowSEO = ({ show, ...props }) => (
  <SEOHead
    title={show.name}
    description={`Watch ${show.name} free online. ${show.overview}`}
    keywords={`${show.name}, TV show, series, free streaming, watch online`}
    image={show.poster}
    type="video.tv_show"
    {...props}
  />
);

export const RadioSEO = ({ station, ...props }) => (
  <SEOHead
    title={`${station.name} - Live Radio`}
    description={`Listen to ${station.name} live radio station free online. ${station.description}`}
    keywords={`${station.name}, radio, live streaming, online radio, ${station.genre}`}
    image={station.logo}
    type="website"
    {...props}
  />
);

export const SearchSEO = ({ query, ...props }) => (
  <SEOHead
    title={`Search Results for "${query}"`}
    description={`Search results for "${query}" on Streamora. Find movies, TV shows, and radio stations.`}
    keywords={`${query}, search, movies, TV shows, streaming`}
    type="website"
    {...props}
  />
);

export default SEOHead;
