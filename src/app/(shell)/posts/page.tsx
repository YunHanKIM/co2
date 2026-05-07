import { fetchCompanies, fetchPosts } from '@/lib/api'
import { PostsBoard } from '@/components/posts/PostsBoard'

const PostsPage = async () => {
  const [posts, companies] = await Promise.all([fetchPosts(), fetchCompanies()])

  return (
    <div className="mx-auto max-w-6xl">
      <PostsBoard initialPosts={posts} companies={companies} />
    </div>
  )
}

export default PostsPage
