import Head from "next/head";

interface IProps {
  title: string;
  description: string;
}

const Header = ({ title, description }: IProps) => (
  <Head>
    <title>{title}</title>
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    <meta name="description" content={description} />

    <link rel="icon" href="/surprised-pikachu.png" />
    <link rel="preload" href="/fonts/pixelPokemonFont.ttf" as="font" crossOrigin="" />
    <link rel="preload" href="/fonts/hdPokemonFont.woff" as="font" crossOrigin="" />
    <link rel="preload" href="/fonts/hdPokemonFont-bold.woff" as="font" crossOrigin="" />
  </Head>
);
export default Header;
