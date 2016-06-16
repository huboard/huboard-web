export function initialize(container, application){
  application.deferReadiness();
}
export default {
  name: 'deferReadiness',
  initialize: initialize
};
