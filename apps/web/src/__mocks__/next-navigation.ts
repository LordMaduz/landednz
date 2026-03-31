export const usePathname = () => '/roadmap'
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
  prefetch: () => Promise.resolve(),
  refresh: () => {},
})
export const useSearchParams = () => new URLSearchParams()
export const useParams = () => ({})