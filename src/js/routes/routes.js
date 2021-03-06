import App from '../App';
import Home from '../components/pages/Home';
import Login from '../components/pages/Login';
import Error from '../components/pages/Error';

function shouldBeLoggedIn(nextState, replace) {
  // const status = getLoginStatus(); //From the State manager
  // if( status && !status.loggedin ){
  //   replace({
  //     pathname: '/login',
  //     state: { nextPathname: nextState.location.pathname }
  //   })
  // }
  console.log('Should be Logged in!')
}

function shouldNotBeLoggedIn(nextState, replace) {
  // const status = getLoginStatus();
  // if( status && status.loggedin ){
  //   replace({
  //     pathname: '/home',
  //     state: { nextPathname: nextState.location.pathname }
  //   })
  // }
  console.log('Should Not be Logged in!')
}

const rootRoute = {
  path: '/',
  component: App,
  indexRoute: {
    component: Login,
    onEnter: shouldNotBeLoggedIn
  },
  indexRedirect: {
    to: '/'
  },
  childRoutes: [ {
      path: 'home',
      component: Home,
      onEnter: shouldBeLoggedIn
    }, {
      path: 'login',
      component: Login,
      onEnter: shouldNotBeLoggedIn
    }, {
      path: 'error',
      component: Error
    }
  ]
}

export default rootRoute;
