export const siteConfig = {
    name: "Doorman",
    url: "http://doorman.localhost:3000",
    ogImage: "/og-image.png",
    description:
        "Beautiful frontend for booking laundry, sauna and other amenities in your apartment building.",
    links: {
        github: "https://github.com/sebdanielsson/doorman",
    },
}

export type SiteConfig = typeof siteConfig

export const META_THEME_COLORS = {
    light: "#ffffff",
    dark: "#09090b",
}
