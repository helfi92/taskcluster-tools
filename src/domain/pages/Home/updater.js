import { Updater } from 'redux-elm';
import initialModel from './model';
// import { pages, external } from '../../routing';



export default new Updater(initialModel)
  .toReducer();
