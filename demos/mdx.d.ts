declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';

  /**
   * MDX component for Next.js (@next/mdx). Content compiled by the MDX loader.
   */
  export default function MDXContent(props: MDXProps): React.JSX.Element;
}
