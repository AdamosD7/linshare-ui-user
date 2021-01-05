angular
  .module('linshare.uploadRequests')
  .controller('uploadRequestsController', uploadRequestsController);

uploadRequestsController.$inject = [
  '_',
  '$q',
  '$timeout',
  '$log',
  '$state',
  'Restangular',
  'lsAppConfig',
  'tableParamsService',
  'toastService',
  'documentUtilsService',
  'uploadRequestGroup',
  'UploadRequestObjectService',
  'uploadRequestGroupRestService',
  'uploadRequestRestService',
  'UPLOAD_REQUESTS_STATE_STATUS_MAPPING',
  'sidebarService',
  'uploadRequestUtilsService',
  'UploadRequestGroupObjectService'
];


function uploadRequestsController(
  _,
  $q,
  $timeout,
  $log,
  $state,
  Restangular,
  lsAppConfig,
  tableParamsService,
  toastService,
  documentUtilsService,
  uploadRequestGroup,
  UploadRequestObjectService,
  uploadRequestGroupRestService,
  uploadRequestRestService,
  UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
  sidebarService,
  uploadRequestUtilsService,
  UploadRequestGroupObjectService
) {
  const uploadRequestsVm = this;
  const { openWarningDialogFor, showToastAlertFor } = uploadRequestUtilsService;
  const filterDeletedUploadRequest = uploadRequests => uploadRequests.filter(request => request.status !== 'DELETED');

  uploadRequestsVm.$onInit = onInit;
  uploadRequestsVm.goBack = goBack;
  uploadRequestsVm.uploadRequestGroup = uploadRequestGroup;
  uploadRequestsVm.openUploadRequest = openUploadRequest;
  uploadRequestsVm.allSelectedHasStatusOf = allSelectedHasStatusOf;
  uploadRequestsVm.openAddingRecipientsSideBar = openAddingRecipientsSideBar;
  uploadRequestsVm.showDetails = showDetails;
  uploadRequestsVm.revalidateDateFields = revalidateDateFields;
  uploadRequestsVm.paramFilter = { recipientEmail: '' };
  uploadRequestsVm.selectedIndex = 0;
  uploadRequestsVm.fabButton = {
    toolbar: {
      activate: true,
      label: 'UPLOAD_REQUESTS.TITLE_SINGULAR'
    },
    actions: [
      {
        label: 'UPLOAD_REQUESTS.TABLE.OPTIONS.ADD_RECIPIENTS',
        icon: 'ls-add-user-sm',
      }
    ]
  };

  function onInit() {
    return uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid)
      .then(filterDeletedUploadRequest)
      .then(uploadRequests => {
        if (uploadRequestGroup.collective) {
          return $state.go('uploadRequestEntries', {
            uploadRequestUuid: uploadRequests[0].uuid
          });
        }

        uploadRequestsVm.itemsList = uploadRequests.map(request => {
          request.recipientEmail = request.recipients[0].mail;

          return request;
        });

        tableParamsService.initTableParams(uploadRequestsVm.itemsList, uploadRequestsVm.paramFilter)
          .then(() => {
            uploadRequestsVm.currentSelectedUploadRequest = {};
            uploadRequestsVm.tableParamsService = tableParamsService;
            uploadRequestsVm.resetSelectedUploadRequests = tableParamsService.resetSelectedItems;
            uploadRequestsVm.selectUploadRequestsOnCurrentPage = tableParamsService.tableSelectAll;
            uploadRequestsVm.toggleUploadRequestSelection = tableParamsService.toggleItemSelection;
            uploadRequestsVm.sortDropdownSetActive = tableParamsService.tableSort;
            uploadRequestsVm.toggleFilterBySelectedFiles = tableParamsService.isolateSelection;
            uploadRequestsVm.toggleSearchState = toggleSearchState;
            uploadRequestsVm.cancelUploadRequests = cancelUploadRequests;
            uploadRequestsVm.closeUploadRequests = closeUploadRequests;
            uploadRequestsVm.archiveUploadRequest = archiveUploadRequest;
            uploadRequestsVm.downloadEntries = downloadEntries;
            uploadRequestsVm.removeArchivedUploadRequests = removeArchivedUploadRequests;
            uploadRequestsVm.updateUploadRequest = updateUploadRequest;
            uploadRequestsVm.selectedUploadRequests = tableParamsService.getSelectedItemsList();
            uploadRequestsVm.tableParams = tableParamsService.getTableParams();
            uploadRequestsVm.flagsOnSelectedPages = tableParamsService.getFlagsOnSelectedPages();
            uploadRequestsVm.toggleSelectedSort = tableParamsService.getToggleSelectedSort();
            uploadRequestsVm.cancelOrCloseSelected = () => {
              if (allSelectedHasStatusOf('CREATED')) {
                return cancelUploadRequests(uploadRequestsVm.selectedUploadRequests);
              }

              if (allSelectedHasStatusOf('ENABLED')) {
                return closeUploadRequests(uploadRequestsVm.selectedUploadRequests);
              }
            };
          });
      });
  }

  function reset() {
    return uploadRequestGroupRestService.listUploadRequests(uploadRequestGroup.uuid)
      .then(filterDeletedUploadRequest)
      .then(uploadRequests => {
        if (uploadRequestGroup.collective) {
          return $state.go('uploadRequestEntries', {
            uploadRequestUuid: uploadRequests[0].uuid
          });
        }

        uploadRequestsVm.itemsList = uploadRequests.map(request => {
          request.recipientEmail = request.recipients[0].mail;

          return request;
        });

        tableParamsService.reloadTableParams(uploadRequestsVm.itemsList);
      });
  }

  function goBack() {
    const status = _.findKey(
      UPLOAD_REQUESTS_STATE_STATUS_MAPPING,
      state => state.includes(uploadRequestGroup.status)
    );

    $state.go(`uploadRequestGroups.${status}`, { reload: true });
  }

  function toggleSearchState() {
    if (!uploadRequestsVm.searchMobileDropdown) {
      angular.element('#drop-area').addClass('search-toggled');
      angular.element('#top-search-wrap input').trigger('focus');
    } else {
      angular.element('#drop-area').removeClass('search-toggled');
      angular.element('#searchInMobileFiles').val('').trigger('change');
    }
    uploadRequestsVm.searchMobileDropdown = !uploadRequestsVm.searchMobileDropdown;
  }

  function allSelectedHasStatusOf(status) {
    return uploadRequestsVm.selectedUploadRequests &&
      uploadRequestsVm.selectedUploadRequests.every(uploadRequest => uploadRequest.status === status);
  }

  function openUploadRequest(uploadRequest) {
    $state.go('uploadRequestEntries', { uploadRequestUuid: uploadRequest.uuid });
  }

  function cancelUploadRequests(uploadRequests) {
    openWarningDialogFor('cancellation', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(request => uploadRequestRestService.updateStatus(request.uuid, 'CANCELED'))
      ))
      .then(promises => {
        const canceledRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notCanceledRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(promise => promise.reason);

        removeFromSelected(canceledRequests);
        updateUploadRequestStatuses(canceledRequests, 'CANCELED');

        if (notCanceledRequests.length) {
          showToastAlertFor('cancellation', 'error', notCanceledRequests);
        } else {
          showToastAlertFor('cancellation', 'info', canceledRequests);
        }
      });
  }

  function closeUploadRequests(uploadRequests) {
    openWarningDialogFor('close', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(
          request => uploadRequestRestService.updateStatus(request.uuid, 'CLOSED')
        )
      ))
      .then(promises => {
        const closedRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notClosedRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(promise => promise.reason);

        removeFromSelected(closedRequests);
        updateUploadRequestStatuses(closedRequests, 'CLOSED');

        if (notClosedRequests.length) {
          showToastAlertFor('close', 'error', notClosedRequests);
        } else {
          showToastAlertFor('close', 'info', closedRequests);
        }
      });
  }

  function archiveUploadRequest(uploadRequest) {
    openWarningDialogFor('archive', uploadRequest)
      .then(isCopied => uploadRequestRestService.updateStatus(uploadRequest.uuid, 'ARCHIVED', {copy: !!isCopied }))
      .then(archivedRequest => {
        removeFromSelected([archivedRequest]);
        updateUploadRequestStatuses([archivedRequest], 'ARCHIVED');
        showToastAlertFor('archive', 'info', [archivedRequest]);
      }).catch(err => {
        if (err) {
          showToastAlertFor('archive', 'error');
        }
      });
  }

  function removeArchivedUploadRequests(uploadRequests) {
    openWarningDialogFor('delete_archived', uploadRequests)
      .then(() => $q.allSettled(
        uploadRequests.map(request => uploadRequestRestService.updateStatus(request.uuid, 'DELETED'))
      ))
      .then(promises => {
        const removedRequests = promises
          .filter(promise => promise.state === 'fulfilled')
          .map(promise => promise.value);
        const notRemovedRequests = promises
          .filter(promise => promise.state === 'rejected')
          .map(reject => reject.reason);

        _.remove(uploadRequestsVm.itemsList, item => removedRequests.some(request => request.uuid === item.uuid));
        _.remove(uploadRequestsVm.selectedUploadRequests, selected => removedRequests.some(request => request.uuid === selected.uuid));

        uploadRequestsVm.tableParams.reload();

        if (notRemovedRequests.length) {
          showToastAlertFor('delete_archived', 'error', notRemovedRequests);
        } else {
          showToastAlertFor('delete_archived', 'info', removedRequests);
        }
      })
      .catch(error => {
        if (error) { $log.error(error); }
      });
  }

  function updateUploadRequestStatuses(updated, status) {
    uploadRequestsVm.itemsList.forEach((item, index) => {
      const isFound = updated.find(request => request.uuid === item.uuid);

      if (isFound) {
        uploadRequestsVm.itemsList[index].status = status;
      }
    });
  }

  function removeFromSelected(list) {
    list.forEach(uploadRequest => {
      const target = uploadRequestsVm.selectedUploadRequests.find(selected => selected.uuid === uploadRequest.uuid);

      if (target) {
        uploadRequestsVm.toggleUploadRequestSelection(target);
      }
    });
  }

  function showDetails(uploadRequest, { selectedIndex = 0 } = {}) {
    // TODO: remove uploadRequestRestService.listEntries when the UR API includes the number of uploaded files.
    $q.all([
      uploadRequestRestService.get(uploadRequest.uuid),
      uploadRequestRestService.listEntries(uploadRequest.uuid)
    ]).then(([responseUploadRequest, entries]) => {
      responseUploadRequest = Restangular.stripRestangular(responseUploadRequest);

      uploadRequestsVm.currentSelected = new UploadRequestObjectService({
        ...responseUploadRequest,
        filesUploaded: entries.length
      });

      uploadRequestsVm.selectedIndex = selectedIndex;
      sidebarService.setData(uploadRequestsVm);
      sidebarService.setContent(lsAppConfig.uploadRequestDetails);
      sidebarService.show();
    });
  }

  function openAddingRecipientsSideBar(uploadRequest = {}) {
    uploadRequest.recipients = uploadRequestsVm.itemsList
      .map(item => item.recipients && item.recipients[0]).filter(Boolean);

    const uploadRequestObject = new UploadRequestGroupObjectService(uploadRequest, {
      submitRecipientsCallback: () => {
        reset();
        sidebarService.hide();
      }
    });

    uploadRequestsVm.currentSelectedUploadRequest = uploadRequest;
    uploadRequestUtilsService.openAddingRecipientsSideBar(uploadRequestObject);
  }

  function setSubmitted(form) {
    form.$setSubmitted();
    form.forEach(item => {
      if (item && item.$$parentForm === form && item.$setSubmitted) {
        setSubmitted(item);
      }
    });
  }

  function updateUploadRequest(form, uploadRequest) {
    if (!form.$valid) {
      setSubmitted(form);
      toastService.error({ key: 'UPLOAD_REQUESTS.FORM_CREATE.FORM_INVALID'});

      return;
    }

    uploadRequest
      .update()
      .then(updated => {
        const itemIndex = uploadRequestsVm.itemsList.findIndex(item => item.uuid === updated.uuid);

        if (itemIndex >= 0) {
          uploadRequestsVm.itemsList[itemIndex] = _.assign(uploadRequestsVm.itemsList[itemIndex], updated);
        }

        uploadRequestsVm.tableParams.reload();
        sidebarService.hide();

        showToastAlertFor('update', 'info');
      })
      .catch(error => (error && showToastAlertFor('update', 'error')));
  }

  function downloadEntries(uploadRequest) {
    const url = uploadRequestGroupRestService.getDownloadEntriesUrl(uploadRequestGroup.uuid, uploadRequest.uuid);

    documentUtilsService.download(url, uploadRequestGroup.label);
  }

  function revalidateDateFields(form) {
    $timeout(() => {
      form.notificationDate.$validate();
      form.expirationDate.$validate();
      form.activationDate.$validate();
    });
  }
}
