type Post = {
  image: string;
  title: string;
  likesNumber: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  url?: string;
};
const demo = (i: number): Post => ({
  image: `https://picsum.photos/seed/surf${i}/600/600`,
  title: `Post ${i}`,
  likesNumber: 1200 + i * 100,
  comments: 40 + i * 3,
  shares: 20 + i * 2,
  saves: 60 + i * 4,
  reach: 15000 + i * 1200,
  url: "#",
});
export function useInstagramPosts() {
  return {
    posts: [demo(1), demo(2), demo(3), demo(4)],
    loading: false,
    refetch: async () => {},
  };
}
