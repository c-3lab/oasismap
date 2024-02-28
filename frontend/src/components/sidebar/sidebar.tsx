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

  return (
    <>
      {session?.user!.type === PROFILE_TYPE.ADMIN ? (
        <AdminSidebar
          isOpen={props.isOpen}
          handleDrawerClose={props.handleDrawerClose}
        />
      ) : (
        <GeneralSidebar
          isOpen={props.isOpen}
          handleDrawerClose={props.handleDrawerClose}
        />
      )}
    </>
  )
}

export default Sidebar
