import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DataTableConfigService } from '@app/core';
import { Peer } from '@app/core/interfaces/ChargingSetting';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
    selector: 'app-peer',
    templateUrl: './peer.component.html',
})
export class PeerComponent implements OnInit, OnDestroy {

    @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();

    @Input() peers: Peer[] = [];
    @Input() isDisabled: boolean = false;
    @Output() peersChange = new EventEmitter<Peer[]>();
    @Output() peerToggleRequest = new EventEmitter<Peer>();

    peerList: Peer[] = [];
    selectedPeer: Peer | null = null;
    formModal: any;
    formModalDelete: any;
    messageShow: string = '';

    constructor(
        private dtConfigService: DataTableConfigService,
    ) { }

    ngOnInit(): void {
        this.loadDtOptions();
        this.initializePeers();

        this.formModal = new window.bootstrap.Modal(document.getElementById('modalPeer'),)
        this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeletePeer'),)
    }

    initializePeers() {
        if (this.peers) {
            this.peerList = [...this.peers];
        }

        setTimeout(() => {
            this.dtTrigger.next(this.dtOptions);
        }, 1000);
    }

    emitChanges() {
        this.peersChange.emit(this.peerList);
    }

    showModal(): void {
        this.formModal.show();
    }

    addPeer(peer: Peer) {
        if (this.selectedPeer) {
            const index = this.peerList.findIndex(p => p === this.selectedPeer);
            if (index !== -1) {
                this.peerList[index] = { ...peer };
            }
        } else {
            if (!peer.id) {
                peer.id = Date.now();
            }
            this.peerList.push(peer);
        }

        this.selectedPeer = null;
        this.emitChanges();
        this.refreshDataTable();
    }

    editPeer(peer: Peer) {
        this.selectedPeer = peer;
        this.formModal.show();
    }

    async deletePeer(peer: Peer) {
        this.selectedPeer = peer;
        this.formModalDelete.show();
        this.messageShow = 'Are you sure you want to delete this peer?';
    }

    onCloseModal(peer?: Peer) {
        this.formModal.hide();
        if (peer) {
            this.addPeer(peer);
        }
    }

    async onCloseModalDelete(confirm: boolean) {
        this.formModalDelete.hide();

        if (confirm && this.selectedPeer) {
            const index = this.peerList.findIndex(p => p.id === this.selectedPeer?.id);

            if (index !== -1) {
                this.peerList.splice(index, 1);
                this.emitChanges();
            }
        }

        this.selectedPeer = null;
        this.refreshDataTable();
    }

    togglePeerStatus(peer: Peer) {
        if (!peer.id) return;

        this.peerToggleRequest.emit(peer);
    }

    isTemporaryId(id?: number): boolean {
        return id !== undefined && id >= 1_000_000_000_000;
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    private refreshDataTable(): void {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(this.dtOptions);
        });
    }

    loadDtOptions() {
        this.dtOptions = {
            ...this.dtConfigService.getConfig(),
            initComplete: () => {
                this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
                        this.onPageLengthChange(len);
                    });
                });
            }
        };
    }

    onPageLengthChange(newPageLength: number): void {
        this.dtConfigService.updateConfig({ pageLength: newPageLength });
        this.dtOptions.pageLength = newPageLength;
    }

}