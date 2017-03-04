export default (state = {}, action) => {
  switch (action.type) {
    case 'INIT':{
      return {
        key: ''
      }
    }

    default:
      return state;
  }
};
