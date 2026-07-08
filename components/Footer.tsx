const year = new Date().getFullYear();

export function Footer({ dark = false }: { dark?: boolean }) {
  return (
    <footer className="mt-auto py-6 px-6 text-center">
      <p
        className={`text-xs leading-relaxed ${
          dark ? "text-white/30" : "text-gray-400"
        }`}
      >
        Coordonné par la Commission Communication
        <br />
        École Porteur de Vie · {year}
      </p>
    </footer>
  );
}
