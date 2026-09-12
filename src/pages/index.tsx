import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const SAMPLE = `import { defineSchema, generate } from "linked-faker";

const schema = defineSchema({
  users: { count: 10, idPrefix: "usr" },
  orders: {
    count: 50,
    relations: { userId: { ref: "users" } },
  },
});

// orders[0].userId → "usr_7"`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const logo = useBaseUrl('/img/logo.svg');

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={clsx('container', styles.heroInner)}>
        <div>
          <div className={styles.brandMark}>
            <img src={logo} alt="" width={36} height={36} />
          </div>
          <Heading as="h1" className={styles.brandName}>
            {siteConfig.title}
          </Heading>
          <p className={styles.headline}>Fake data that actually joins.</p>
          <p className={styles.support}>
            Declare entities and relations once. Get users, orders, and
            products wired together with valid foreign keys—seeded,
            reproducible, and ready to export as JSON, CSV, or SQL.
          </p>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--lg', styles.primaryCta)}
              to="/docs/getting-started">
              Getting Started
            </Link>
            <Link
              className={clsx('button button--lg', styles.ghostCta)}
              to="/docs/relations">
              Relations
            </Link>
          </div>
        </div>

        <pre className={styles.codeStage} aria-label="Example generate usage">
          <div className={styles.codeChrome}>
            <span />
            <span />
            <span />
            <label>seed.ts</label>
          </div>
          <code className={styles.codeBody}>
            {SAMPLE}
            <span className={styles.cursor} aria-hidden="true" />
          </code>
        </pre>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Relational fake data generator"
      description="Generate realistic, relational fake data with valid foreign keys from a declarative schema. Seeded, validated, and exportable to JSON, CSV, or SQL.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
