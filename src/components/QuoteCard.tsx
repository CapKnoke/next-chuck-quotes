import * as React from 'react';
import { ChuckQuote } from '../types/chuckApi';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';

const QuoteCard: React.FC<{ quote: ChuckQuote }> = ({ quote }) => {
  const { data: session } = useSession();
  
  const [counter, setCounter] = React.useState<number | null>(null);
  const [comments, setComments] = React.useState<any[]>([]);
  
  const commentInpitRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const quoteRef = doc(db, 'quotes', quote.id);
    getDoc(quoteRef).then((document) => {
      if (!document.exists()) {
        setDoc(quoteRef, { charlieUtterances: 0 });
        setCounter(0);
        return;
      }
      setCounter(document.get('charlieUtterances'));
      console.log(document.data());
    });
    const unsubscribe = onSnapshot(collection(db, 'quotes', quote.id, 'comments'), (snapshot) => {
      const newComments = snapshot.docChanges().map((change) => {
        if (change.type === 'added') {
          return {...change.doc.data()};
        }
      });
      console.log({ 'added comment(s)': newComments });
      setComments(prev => [...prev, ...newComments]);
    });
    return () => unsubscribe();
  }, [quote.id]);

  React.useEffect(() => {
    if (counter) {
      updateDoc(doc(db, 'quotes', quote.id), { charlieUtterances: counter });
    }
  }, [counter, quote.id]);

  return (
    <Disclosure
      as="div"
      className="border-2 border-neutral-400 rounded-md p-6 shadow-lg dark:border-neutral-800 bg-neutral-900"
    >
      {({ open }) => (
        <>
          <p className="text-neutral-600 py-6 text-lg italic before:content-['❝'] after:content-['❞'] before:px-1 after:px-1 text-center dark:text-neutral-200">
            {quote.value}
          </p>
          <hr className="my-4 dark:border-neutral-800" />
          <div className="flex gap-4 items-center font-mono justify-between">
            <div className="px-2 flex gap-2">
              Utterances: {typeof counter === 'number' ? <span>{counter}</span> : null}
              {typeof counter === 'number' ? (
                <button
                  className="cursor-pointer px-3 rounded-sm bg-neutral-700 hover:bg-neutral-600"
                  onClick={() => setCounter(counter + 1)}
                >
                  +
                </button>
              ) : null}
            </div>
            <Disclosure.Button as="div" className="flex items-center gap-4">
              <span>Comments: {comments?.length || 0}</span>
              <ChevronDownIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`} />
            </Disclosure.Button>
          </div>
          <Disclosure.Panel>
            {comments.map((comment, index) => {
              return (
                <div key={index} className="flex justify-between">
                  <div>{comment.content}</div>
                  <div>{new Date(comment.createdAt).toDateString()}</div>
                </div>
              );
            })}
            <form
              className="flex gap-4 p-2"
              onSubmit={(e) => {
                e.preventDefault();
                addDoc(collection(db, 'quotes', quote.id, 'comments'), {
                  content: commentInpitRef.current?.value,
                  createdAt: new Date().toISOString(),
                  author: session?.user,
                });
              }}
            >
              <input className="w-full py-1 px-2 rounded-sm" ref={commentInpitRef} type="text" />
              <button type="submit">submit</button>
            </form>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default QuoteCard;
