
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { getAppProps } from "../utils/getAppProps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"; 

export default function Success() {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <FontAwesomeIcon icon={faCheckCircle} className="text-7xl text-green-600 mb-4" />
      <h1 className="text-3xl mb-4 text-green-600">Thank you for your payment!</h1>
    </div>
  );
}

Success.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props
    }
  }
});