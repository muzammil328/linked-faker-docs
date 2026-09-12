import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  label: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Valid foreign keys',
    label: '01',
    description: (
      <>
        Every <code>ref</code> resolves to a real generated id. Entities are
        built in topological order, so schema order never matters.
      </>
    ),
  },
  {
    title: 'Reproducible',
    label: '02',
    description: (
      <>
        Pass <code>{'{ seed: 42 }'}</code> and the same schema returns the same
        dataset every run—ideal for fixtures and snapshot tests.
      </>
    ),
  },
  {
    title: 'Export anywhere',
    label: '03',
    description: (
      <>
        Ship the result straight to your ORM, or call <code>exportAs</code> for
        JSON, per-entity CSV, or dialect-aware SQL inserts.
      </>
    ),
  },
];

function Feature({title, label, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <p className={styles.label}>{label}</p>
      <Heading as="h3" className={styles.title}>
        {title}
      </Heading>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
