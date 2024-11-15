import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Login from '@/components/auth/Login';
import Logout from '@/components/auth/Logout';
import { GetServerSidePropsContext } from 'next';
import { getServerSession, Session } from 'next-auth';


export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      session: await getServerSession(
        context.req,
        context.res,
        authOptions
      ),
    },
  }
}

export default function Auth( props: {session: Session}) {
  return (
    <>
      { props.session &&
        <div>
          <div>Your name is {props.session.user?.name}</div>
          <div><Logout /> </div>
        </div>
      }
      { !props.session &&
        <div>
          <div><Login /> </div>
        </div>
      }
    </>
  )
}