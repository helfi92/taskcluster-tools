import { Component } from 'react';
import { Link } from 'react-router-dom';
import resolve from 'resolve-pathname';
import 'prismjs/themes/prism.css';
import HelmetTitle from '../components/HelmetTitle';
import Error from '../components/Error';
import ManualSidebar from './ManualSidebar';
import ReferenceSidebar from './ReferenceSidebar';
import { container } from './styles.module.css';
import './globals.css';

export default class Documentation extends Component {
  state = {
    error: null,
    Document: null,
    meta: null
  };

  componentWillMount() {
    this.handleLoadDocument(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.handleLoadDocument(nextProps);
  }

  handleImport = url => {
    const doc = url ? url.replace(/\/$/, '') : 'index';

    return import(`./${doc}.md`).catch(() => import(`./${doc}/index.md`));
  };

  handleLoadDocument = async ({ match }) => {
    try {
      const { default: Document, meta } = await this.handleImport(
        match.params.path
      );

      this.setState({ Document, meta, error: null });
    } catch (error) {
      this.setState({ error });
    }
  };

  anchorFactory = ({ href, ...props }, ...children) => {
    if (href.startsWith('http')) {
      return (
        <a href={href} {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }

    const { location } = this.props;
    const url = resolve(href, location.pathname);

    return (
      <Link to={url} {...props}>
        {children}
      </Link>
    );
  };

  renderSidebar() {
    const { pathname } = this.props.location;

    if (pathname.includes('/docs/manual')) {
      return <ManualSidebar />;
    } else if (pathname.includes('/docs/reference')) {
      return <ReferenceSidebar />;
    }

    return null;
  }

  render() {
    const { error, Document, meta } = this.state;

    if (error) {
      return <Error error={error} />;
    }

    if (!Document) {
      return null;
    }

    return (
      <div className={container}>
        {meta.title && <HelmetTitle title={meta.title} />}
        {this.renderSidebar()}
        <Document
          factories={{
            a: this.anchorFactory
          }}
        />
      </div>
    );
  }
}
