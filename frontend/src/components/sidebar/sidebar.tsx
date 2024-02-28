import { useSession } from 'next-auth/react'
import { PROFILE_TYPE } from '@/libs/constants'
import GeneralSidebar from '@/components/sidebar/general-sidebar'
import AdminSidebar from '@/components/sidebar/admin-sidebar'

interface SidebarProps {
  isOpen?: boolean
  handleDrawerClose: () => void
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { data: session } = useSession()

  if (session?.user?.type === PROFILE_TYPE.ADMIN) {
    return (
      <AdminSidebar
        isOpen={props.isOpen}
        handleDrawerClose={props.handleDrawerClose}
      />
    )
  }
  if (session?.user?.type === PROFILE_TYPE.GENERAL) {
    return (
      <GeneralSidebar
        isOpen={props.isOpen}
        handleDrawerClose={props.handleDrawerClose}
      />
    )
  }

  return <></>
}

export default Sidebar
