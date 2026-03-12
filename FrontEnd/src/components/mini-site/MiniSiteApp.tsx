import { MiniSiteNavProvider, useMiniSiteNav } from './MiniSiteNav'
import MiniSiteLayout from './MiniSiteLayout'
import MiniSiteHome from './MiniSiteHome'
import ServiceDetail from './ServiceDetail'

function MiniSiteRouter() {
  const { path } = useMiniSiteNav()

  const serviceMatch = path.match(/^\/service\/(.+)$/)
  if (serviceMatch) return <ServiceDetail slug={serviceMatch[1]} />
  return <MiniSiteHome />
}

export default function MiniSiteApp() {
  return (
    <MiniSiteNavProvider>
      <MiniSiteLayout>
        <MiniSiteRouter />
      </MiniSiteLayout>
    </MiniSiteNavProvider>
  )
}
