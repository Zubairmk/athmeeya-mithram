import Link from "next/link";

type Category = { id: string; slug: string; name_ml: string };

export default function CategoryNav({ categories }: { categories: Category[] }) {
  return (
    <ul className="divide-y divide-shell-muted/15 border-y border-shell-muted/15">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/category/${category.slug}`}
            className="block py-4 text-sm text-shell-muted transition-colors hover:text-manuscript"
          >
            {category.name_ml}
          </Link>
        </li>
      ))}
    </ul>
  );
}
