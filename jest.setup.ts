import * as Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
// import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({adapter: new Adapter()});
