import Link from "next/link";

type Category = { id: string; slug: string; name_ml: string };

export default function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/category/${category.slug}`}
            className="flex items-center justify-between py-3.5 text-[13.5px] font-medium text-ink transition-colors hover:text-green"
          >
            {category.name_ml}
            <span className="text-green">&rsaquo;</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
