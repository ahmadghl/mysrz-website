import { PostEditorForm } from '@/components/admin/PostEditorForm';
export const metadata = { title: 'New Post · mySRZ Admin' };
export default function NewPostPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="text-sm text-gray-500 mt-0.5">Write and publish a new blog post</p>
      </div>
      <PostEditorForm mode="new" />
    </div>
  );
}
