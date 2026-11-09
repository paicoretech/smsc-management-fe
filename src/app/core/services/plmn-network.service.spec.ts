import { PlmnNetworkPayload, PlmnPrefixPayload } from '../interfaces/PlmnNetwork';
import { ConnectionService } from '../utils/connection.service';
import { PlmnNetworkService } from './plmn-network.service';

describe('PlmnNetworkService', () => {
  let connectionService: jasmine.SpyObj<ConnectionService>;
  let service: PlmnNetworkService;

  beforeEach(() => {
    connectionService = jasmine.createSpyObj<ConnectionService>('ConnectionService', ['send']);
    service = new PlmnNetworkService(connectionService);
  });

  it('loads networks', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.getNetworks();

    expect(connectionService.send).toHaveBeenCalledOnceWith('plmn-network', 'get');
  });

  it('loads a paginated and filtered network list', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.getNetworksPage(2, 25, 'Spain & ES');

    expect(connectionService.send).toHaveBeenCalledOnceWith(
      'plmn-network?offset=2&limit=25&search=Spain%20%26%20ES',
      'get',
    );
  });

  it('loads the country catalog', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.getCountries();

    expect(connectionService.send).toHaveBeenCalledOnceWith('plmn-country', 'get');
  });

  it('creates and updates a network', async () => {
    const payload: PlmnNetworkPayload = {
      mnc: '21',
      network_name: 'Claro NI',
      plmn_country_id: 152,
    };
    connectionService.send.and.resolveTo(successResponse());

    await service.createNetwork(payload);
    await service.updateNetwork(7, payload);

    expect(connectionService.send.calls.argsFor(0)).toEqual(['plmn-network/create', 'post', payload]);
    expect(connectionService.send.calls.argsFor(1)).toEqual(['plmn-network/update/7', 'put', payload]);
  });

  it('deletes a network', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.deleteNetwork(7);

    expect(connectionService.send).toHaveBeenCalledOnceWith('plmn-network/delete/7', 'delete');
  });

  it('loads prefixes', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.getPrefixes();

    expect(connectionService.send).toHaveBeenCalledOnceWith('plmn-prefix', 'get');
  });

  it('loads a paginated and filtered prefix list', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.getPrefixesPage(3, 10, '505-8');

    expect(connectionService.send).toHaveBeenCalledOnceWith(
      'plmn-prefix?offset=3&limit=10&search=505-8',
      'get',
    );
  });

  it('creates and updates a prefix', async () => {
    const payload: PlmnPrefixPayload = {
      id: 8,
      prefix: '5058',
      sn_range_start: '50580000',
      sn_range_stop: '50589999',
      plmn_id: 7,
    };
    connectionService.send.and.resolveTo(successResponse());

    await service.createPrefix(payload);
    await service.updatePrefix(8, payload);

    expect(connectionService.send.calls.argsFor(0)).toEqual(['plmn-prefix/create', 'post', payload]);
    expect(connectionService.send.calls.argsFor(1)).toEqual(['plmn-prefix/update/8', 'put', payload]);
  });

  it('uploads prefixes', async () => {
    const formData = new FormData();
    formData.append('plmnId', '7');
    connectionService.send.and.resolveTo({ status: 200 } as any);

    await service.uploadPrefixes(formData);

    expect(connectionService.send).toHaveBeenCalledOnceWith('plmn-prefix/upload', 'post', formData);
  });

  it('deletes a prefix', async () => {
    connectionService.send.and.resolveTo(successResponse());

    await service.deletePrefix(8);

    expect(connectionService.send).toHaveBeenCalledOnceWith('plmn-prefix/delete/8', 'delete');
  });

  function successResponse() {
    return {
      status: 200,
      message: 'success',
      comment: 'ok',
      data: null,
    };
  }
});
