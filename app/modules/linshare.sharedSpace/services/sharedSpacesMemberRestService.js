angular
  .module('linshare.sharedSpace')
  .factory('sharedSpaceMembersRestService', sharedSpaceMembersRestService);

sharedSpaceMembersRestService.$inject = ['$log', 'Restangular', 'ServerManagerService'];

/**
 *  @namespace sharedSpaceMembersRestService
 *  @desc Service to interact with Workgroup Member object by REST
 *  @memberOf LinShare.sharedSpace
 */
function sharedSpaceMembersRestService($log, Restangular, ServerManagerService) {
  var
    handler = ServerManagerService.responseHandler,
    restUrl = 'shared_spaces',
    restParam = 'members',
    service = {
      create: create,
      get: get,
      getList: getList,
      remove: remove,
      update: update
    };

  return service;

  ////////////

  /**
   * The Account object.
   * @typedef {Object} Account
   * @property {String} name - The name of the account
   * @property {String} uuid - The unique identifier of the account
   * @property {String} firstName - The first name of the account
   * @property {String} lastName - The last name of the account
   * @property {String} mail - The mail of the account
   */

  /**
   * The Member object.
   * @typedef {Object} WorkgroupMember
   * @property {Role} role - A {@link Role} object.
   * @property {Node} node - Name & Uuid of {@link Node} object.
   * @property {Account} account - all of {@link Account} object.
   */

  /**
   * The Node object.
   * @typedef {Object} Node
   * @property {Date} creationDate - The creation date of the node.
   * @property {Date} modificationDate - The last modification date of the node.
   * @property {String} name - The name of the node.
   * @property {String} uuid - The uuid of the node.
   */

  /**
   *  @name create
   *  @desc Create a Workgroup Member object
   *  @param {WorkgroupMember} workgroupMemberDto - The Workgroup Member object
   *  @returns {Promise<WorkgroupMember>} server response
   *  @memberOf LinShare.sharedSpace.sharedSpaceMembersRestService
   */
  function create(workgroupMemberDto) {
    $log.debug('sharedSpaceMembersRestService : create', workgroupMemberDto);

    return handler(
      Restangular
        .one(restUrl, workgroupMemberDto.node.uuid)
        .all(restParam)
        .post(workgroupMemberDto)
    );
  }

  /**
   *  @name get
   *  @desc Get a Workgroup Member object
   *  @param {String} nodeUuid - The id of the Workgroup object
   *  @param {String} accountUuid - The id of the Workgroup Member object
   *  @returns {Promise<WorkgroupMember>} server response
   *  @memberOf LinShare.sharedSpace.sharedSpaceMembersRestService
   */
  function get(nodeUuid, accountUuid) {
    $log.debug('sharedSpaceMembersRestService :  get', nodeUuid, accountUuid);

    return handler(Restangular.one(restUrl, nodeUuid).one(restParam, accountUuid).get());
  }

  /**
   *  @name getList
   *  @desc Get the list of Workgroup Member object
   *  @param {String} nodeUuid - The id of the Workgroup object
   *  @returns {Promise<Array<WorkgroupMember>>} server response
   *  @memberOf LinShare.sharedSpace.sharedSpaceMembersRestService
   */
  function getList(nodeUuid) {
    $log.debug('sharedSpaceMembersRestService :  getList', nodeUuid);

    return handler(Restangular.one(restUrl, nodeUuid).all(restParam).getList());
  }

  /**
   *  @name remove
   *  @desc Remove a Workgroup Member object
   *  @param {String} nodeUuid - The id of the Node object
   *  @param {String} accountUuid - The id of the Account object
   *  @returns {Promise?} server response
   *  @memberOf LinShare.sharedSpace.sharedSpaceMembersRestService
   */
  function remove(nodeUuid, accountUuid) {
    $log.debug('sharedSpaceMembersRestService :  remove', nodeUuid, accountUuid);

    return handler(Restangular.one(restUrl, nodeUuid).one(restParam, accountUuid).remove());
  }

  /**
   *  @name update
   *  @desc Update a Workgroup Member object
   *  @param {WorkgroupMember} workgroupMemberDto - The Workgroup Member object
   *  @returns {Promise<WorkgroupMember>} server response
   *  @memberOf LinShare.sharedSpace.sharedSpaceMembersRestService
   */
  function update(workgroupMemberDto, force = false) {
    $log.debug('sharedSpaceMembersRestService : update', workgroupMemberDto);

    return handler(
      Restangular
        .one(restUrl, workgroupMemberDto.node.uuid)
        .one(restParam, workgroupMemberDto.account.uuid)
        .customPUT(workgroupMemberDto, '', { force })
    );
  }
}