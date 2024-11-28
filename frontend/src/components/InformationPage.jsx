import React, { useState, useEffect } from "react";
import { loadMarkdownFiles } from "../utils/markdownLoader";

const InformationPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const loadedPosts = await loadMarkdownFiles();
        setPosts(loadedPosts);
      } catch (err) {
        setError("Error al cargar los artículos");
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando artículos...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Documentación</h1>
      <div className="space-y-16">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-blue-600 bg-white rounded-lg shadow-lg p-8 border border-gray-100"
          >
            <h2 className="text-3xl font-bold mb-2 text-gray-800">
              {post.title}
            </h2>
            <div className="flex items-center text-sm text-gray-500 mb-8 not-prose">
              {post.date && (
                <time dateTime={post.date}>
                  {new Date(post.date).toISOString().split("T")[0]}
                </time>
              )}
              {post.author && (
                <>
                  <span className="mx-2">•</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>
            <div
              className="mt-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <hr className="my-8 border-gray-200" />
          </article>
        ))}
      </div>
    </div>
  );
};

export default InformationPage;
