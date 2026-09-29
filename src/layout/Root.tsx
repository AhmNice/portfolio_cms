import { Outlet } from 'react-router'
import SessionChecker from '../root/session'

const Root = () => {
  return (
    <div>
      <SessionChecker />
      <main>
        <Outlet/>
      </main>
    </div>
  )
}

export default Root
