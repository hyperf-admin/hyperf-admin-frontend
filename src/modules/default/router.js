import router from '@/router'
import Layout from '@/layout'

const moduleRouter = router
moduleRouter.addRoutes([
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import(`@/components/Common/DashBoard`),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  }
])

export default moduleRouter
