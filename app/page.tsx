import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Logo from './components/Logo';
import Pagination from './components/Pagination';
import SearchInput from './components/SearchInput';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Drops - Your Bookmarks',
    description: 'Manage and view your Raindrop bookmarks',
  };
}

async function getLastBookmarks() {
  const cookieStore = await cookies();
  const token = cookieStore.get('raindrop_access_token');

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      'https://api.raindrop.io/rest/v1/raindrops/0',
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return 'unauthorized';
      }
      return 'error';
    }

    const data = await response.json();
    return data.items;
  } catch {
    // Catch block without error parameter
    return 'error';
  }
}

export default async function Home(props: any) {
  const { searchParams = {} } = props;
  const page =
    Number(
      Array.isArray(searchParams?.page)
        ? searchParams.page[0]
        : searchParams?.page
    ) || 1;
  const search = Array.isArray(searchParams?.search)
    ? searchParams.search[0]
    : searchParams?.search || '';
  const perPage = 10; // Number of bookmarks per page

  const bookmarks = await getLastBookmarks();

  if (bookmarks === null || bookmarks === 'unauthorized') {
    redirect('/raindrop-auth');
  }

  if (bookmarks === 'error') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error Fetching Bookmarks</h1>
        <p className="text-red-600 mb-4">
          There was an error fetching your bookmarks. Please try again later.
        </p>
      </div>
    );
  }

  // Filter bookmarks based on search term
  const filteredBookmarks = bookmarks.filter(
    (bookmark: Bookmark) =>
      bookmark.title.toLowerCase().includes(search.toLowerCase()) ||
      bookmark.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
      bookmark.tags?.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Paginate bookmarks
  const totalPages = Math.ceil(filteredBookmarks.length / perPage);
  const paginatedBookmarks = filteredBookmarks.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const showPagination = filteredBookmarks.length > perPage;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Logo />
      </div>
      <SearchInput />
      {paginatedBookmarks.length === 0 ? (
        <p>No drops found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {paginatedBookmarks.map((bookmark: Bookmark) => (
              <li key={bookmark._id} className="border p-4 rounded-lg">
                <a
                  href={bookmark.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  <h2 className="text-xl font-semibold">{bookmark.title}</h2>
                </a>
                {bookmark.excerpt && (
                  <p className="text-gray-600 mt-2">{bookmark.excerpt}</p>
                )}
                <div className="mt-2">
                  {bookmark.tags &&
                    bookmark.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </li>
            ))}
          </ul>
          {showPagination && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </>
      )}
    </div>
  );
}

interface Bookmark {
  _id: string;
  link: string;
  title: string;
  excerpt?: string;
  tags?: string[];
}
