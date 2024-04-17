import Link from "next/link";
import { BookOpen, BarChart2, Home } from "react-feather";
import SVGLogo from "./SVGLogo";
interface SidebarLink {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const links: SidebarLink[] = [
  {
    label: "Journal",
    icon: <BookOpen />,
    href: "/journal",
  },
  {
    label: "History",
    icon: <BarChart2 />,
    href: "/history",
  },
  {
    label: "Home",
    icon: <Home />,
    href: "/",
  },
];

export const Sidebar = () => {
  return (
    <>
      <aside className="absolute w-[220px] top-0 left-0 h-full border-r border-white/10">
        <div className="flex flex-row items-center cursor-pointer font-bold transition-transform duration-300 transform hover:translate-x-2">
          <SVGLogo />
          Audio-Mood
        </div>
        <ul>
          {links.map((link) => (
            <li key={link.href} className="px-4 py-6 text-xl">
              <Link
                href={link.href}
                className="flex flex-row gap-2 transition-transform duration-200 transform hover:translate-x-2 hover:text-[#ddd1f4]"
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};
