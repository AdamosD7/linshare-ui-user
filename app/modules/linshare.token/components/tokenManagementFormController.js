angular
  .module('linshare.token')
  .controller('tokenManagementFormController', tokenManagementFormController);

tokenManagementFormController.$inject = [
  'lsAppConfig',
  'jwtRestService',
  'sidebarService',
  'tokenManagementUtilsService',
  'toastService'
];

function tokenManagementFormController(
  lsAppConfig,
  jwtRestService,
  sidebarService,
  tokenManagementUtilsService,
  toastService
) {
  const tokenManagementFormVm = this;
  const { promptCreatedToken, showToastAlertFor } = tokenManagementUtilsService;
  const { onCreateSuccess, onUpdateSuccess } = sidebarService.getData();

  tokenManagementFormVm.$onInit = onInit;
  tokenManagementFormController.createToken = createToken;
  tokenManagementFormController.updateToken = updateToken;

  function onInit() {
    if (sidebarService.getContent() === lsAppConfig.tokenCreate) {
      sidebarService.addData('createToken', createToken);
    }

    if (sidebarService.getContent() === lsAppConfig.tokenDetails) {
      sidebarService.addData('updateToken', updateToken);
    }

    setTimeout(() => angular.element('#tokenLabel').trigger('focus'), 300);
  }

  function createToken() {
    if (!tokenManagementFormVm.tokenObject.label) {
      return toastService.error({ key: 'TOAST_ALERT.WARNING.ENTER_TOKEN_NAME' });
    }
    jwtRestService.create(tokenManagementFormVm.tokenObject)
      .then(created => {
        promptCreatedToken(created.token);
        showToastAlertFor('create', 'success');
        onCreateSuccess(created);
      }).catch(error => {
        if (error) {
          showToastAlertFor('create', 'error');
        }
      });
  }

  function updateToken() {
    jwtRestService.update(tokenManagementFormVm.tokenObject, tokenManagementFormVm.tokenObject.uuid)
      .then(updated => {
        showToastAlertFor('update', 'success');
        onUpdateSuccess(updated);
      }).catch(error => {
        if(error) {
          showToastAlertFor('update', 'error');
        }
      });
  }
}
