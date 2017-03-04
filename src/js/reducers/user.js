export default (state = {}, action) => {
  switch (action.type) {
    case 'INIT':{
      return {
        loggiedIn: false
      }
    }

    default:
      return state;
  }
};
