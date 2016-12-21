'use strict';

angular.module('linshareUiUserApp')
  .constant('lsAppConfig', {
    baseRestUrl: 'linshare/webservice/rest/user/v2', // default: 'linshare/webservice/rest/user/v2'
    localPath: 'i18n/original', //custom your i18n folder path
    postLogoutUrl: null, // default : null, example 'http://my.fake.page.for.sso',
    debug: true,
    date_fr_format: 'dd/MM/yyyy',
    date_en_format: 'MM/dd/yyyy',
    simultaneous_upload: 1,
    devMode: true,
    production: false,
    mySpacePage: 'myspace',
    workgroupPage: 'workgroup',
    guestsList: 'guests-list',
    workgroupList: 'group_list',
    contactsListsMinePage: 'contactslists-mine',
    contactsListsOthersPage: 'contactslists-others',
    lang: {
      fr: 'fr-FR',
      en: 'en-US',
      vi: 'vi-VN'
    },
    accountType: {
      internal: 'INTERNAL',
      guest: 'GUEST'
    },

    //Value used for sidebar
    share: 'share',
    moreOptions: 'more-options',
    shareDetails: 'share-details',
    activeShareDetails: 'active-share-details',
    guestCreate: 'guest-create',
    guestDetails: 'guest-details',
    details: 'details',
    addMember: 'add-member',
    workgroupDetailFile: 'workgroup-detail-file',
    contactslists: 'contactslists',
    contactslistsAddContacts: 'contactslists-add-contacts',
    contactslistsContact: 'contactslists-contact'
  });
