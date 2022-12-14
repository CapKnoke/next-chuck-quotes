import * as React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import QuoteCard from '../components/QuoteCard';
import { ChuckApiResponse, ChuckQuote } from '../types/chuckApi';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from './api/auth/[...nextauth]';

export const getServerSideProps: GetServerSideProps<{
  session: Session | null;
}> = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
      props: { session },
    };
  }
  return {
    props: { session },
  };
};

const getQuotes = async () => {
  const apiResponse = await fetch('https://api.chucknorris.io/jokes/search?query=hand');
  const { result } = (await apiResponse.json()) as ChuckApiResponse;
  return result.slice(0,1)
}

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  session,
}) => {
  const [quotes, setQuotes] = React.useState<ChuckQuote[] | null>(null);
  React.useEffect(() => {
    getQuotes()
      .then(setQuotes)
  })
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto py-12 px-4">
        <button className="static top-0 left-0" onClick={() => signOut()}>
          Sign Out
        </button>
        <h1 className="text-4xl font-bold uppercase text-center">Chuck Norris Quotes</h1>
        <section className="flex flex-col py-12 gap-8 max-w-lg mx-auto">
          {quotes?.map((quote, index) => {
            return <QuoteCard key={index} quote={quote} />;
          })}
        </section>
      </main>
    </>
  );
};

export default Home;
