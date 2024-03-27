import { Component, ElementRef, OnInit, Renderer2, ViewChild, inject } from '@angular/core';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import FeatureReductionCluster from '@arcgis/core/layers/support/FeatureReductionCluster';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Color from '@arcgis/core/Color';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import SizeVariable from '@arcgis/core/renderers/visualVariables/SizeVariable';
import { ASSETS, Asset } from './model';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";

@Component({
    selector: 'app-root',
    standalone: true,
    template: `
    <div #mapViewNode class="claro" id="map"></div>
  `,
    styles: [
        `#map {
            padding: 0;
            margin: 0;
            width: 100vw;
            height: 100vh;
        }`,
        `.instructions {
            display: flex;
            flex-direction: column;
            max-width: 50vw;
            background: #fff;
            padding: .75em;
            border-radius: .5em;
        }`
    ],
})
export class AppComponent implements OnInit {

    @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef<HTMLDivElement>;
    private _webMap!: MapView;
    private renderer = inject(Renderer2);
    private _sizeVisualVariable!: SizeVariable;

    ngOnInit(): void {
        this._sizeVisualVariable = new SizeVariable({
            field: 'cluster_count',
            stops: [
                { value: 1, size: 30 },
                { value: 2, size: 15 },
                { value: 50, size: 25 },
                { value: 100, size: 35 },
                { value: 250, size: 45 },
            ],
        });
        this._loadMap();
        this.displayAssets(ASSETS);
    }

    private _loadMap() {
        const webmap = new WebMap({ basemap: 'topo-vector' });
        const view = new MapView({
            container: 'map',
            map: webmap,
            center: [1.4442, 43.6047], // Longitude, latitude
            zoom: 6, // Zoom level,
            spatialReference: { wkid: 102100 },
            constraints: {
                minZoom: 2,
            },
            popup: {
                dockOptions: {
                    position: 'bottom-center',
                },
                highlightEnabled: false,
            },
        });
        this._webMap = view;
        this._webMap.map.layers.push(this._createAssetLayer());
        const el = this.renderer.createElement('div');
        const firstLine = this.renderer.createElement('span');
        this.renderer.appendChild(firstLine, this.renderer.createText(`Click on a cluster, and cycle through the items to see the deformed pinpoint.`));
        const secondLine = this.renderer.createElement('span');
        this.renderer.appendChild(secondLine, this.renderer.createText(`You can dock the popup for better visibility.`));
        this.renderer.appendChild(el, firstLine);
        this.renderer.appendChild(el, secondLine);
        this.renderer.addClass(el, 'instructions');
        this._webMap.ui.add(el, 'top-right');
    }

    /**
     * Create the layer for the assets
     */
    private _createAssetLayer(): FeatureLayer {
        // Create the layer
        const configReductionAsset = new FeatureReductionCluster({
            clusterRadius: '125px',
            popupTemplate: {
                title: 'Cluster summary',
                content: (event: any) => {
                    const cluster_count = event.graphic.attributes.cluster_count;
                    return `There are ${cluster_count} assets in this cluster.`;
                },
                fieldInfos: [
                    {
                        fieldName: 'cluster_count',
                        format: {
                            places: 0,
                            digitSeparator: true,
                        },
                    },
                ],
            },
            symbol: new SimpleMarkerSymbol({
                style: 'circle',
                color: new Color([103, 58, 183, 0.75]),
                outline: undefined,
                size: 20,
            }),
            labelingInfo: [
                {
                    deconflictionStrategy: 'none',
                    labelExpressionInfo: {
                        expression: `$feature.cluster_count`,
                    },
                    symbol: {
                        type: 'text',
                        color: new Color('white'),
                        font: {
                            weight: 'bold',
                            family: 'Noto Sans',
                            size: '12px',
                        },
                    },
                    labelPlacement: 'center-center',
                },
            ],
        });

        const assetLayer = new FeatureLayer({
            id: 'assets',
            layerId: 0,
            source: [],
            objectIdField: 'OID',
            geometryType: 'point',
            featureReduction: configReductionAsset,
            spatialReference: { wkid: 102100 },
            fields: [
                { name: 'id', alias: 'id', type: 'string' },
                { name: 'name', alias: 'name', type: 'string' },
                { name: 'pinpoint', alias: 'pinpoint', type: 'string' },
            ],
            renderer: new SimpleRenderer({
                symbol: new PictureMarkerSymbol({
                    // Generated
                    url: 'data:image/svg+xml;base64,PHN2ZyBfbmdjb250ZW50LW5nLWMyOTkxMzI4NzI5PSIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48c3ZnIF9uZ2NvbnRlbnQtbmctYzI5OTEzMjg3Mjk9IiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMjAiIHZpZXdCb3g9IjAgMCAzODQgNTEyLjAwMDEyMjA3MDMxMjUiPjxwYXRoIF9uZ2NvbnRlbnQtbmctYzI5OTEzMjg3Mjk9IiIgZD0iTTE3Mi4yNjggNTAxLjY3QzI2Ljk3IDI5MS4wMzEgMCAyNjkuNDEzIDAgMTkyIDAgODUuOTYxIDg1Ljk2MSAwIDE5MiAwczE5MiA4NS45NjEgMTkyIDE5MmMwIDc3LjQxMy0yNi45NyA5OS4wMzEtMTcyLjI2OCAzMDkuNjctOS41MzUgMTMuNzc0LTI5LjkzIDEzLjc3My0zOS40NjQgMHoiIGZpbGw9IiNmZmZmZmYiPjwvcGF0aD48L3N2Zz48c3ZnIF9uZ2NvbnRlbnQtbmctYzI5OTEzMjg3Mjk9IiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMzg0IDUxMi4wMDAxMjIwNzAzMTI1Ij48cGF0aCBfbmdjb250ZW50LW5nLWMyOTkxMzI4NzI5PSIiIGQ9Ik0xNzIuMjY4IDUwMS42N0MyNi45NyAyOTEuMDMxIDAgMjY5LjQxMyAwIDE5MiAwIDg1Ljk2MSA4NS45NjEgMCAxOTIgMHMxOTIgODUuOTYxIDE5MiAxOTJjMCA3Ny40MTMtMjYuOTcgOTkuMDMxLTE3Mi4yNjggMzA5LjY3LTkuNTM1IDEzLjc3NC0yOS45MyAxMy43NzMtMzkuNDY0IDB6TTE5MiAyNzJjNDQuMTgzIDAgODAtMzUuODE3IDgwLTgwcy0zNS44MTctODAtODAtODAtODAgMzUuODE3LTgwIDgwIDM1LjgxNyA4MCA4MCA4MHoiIGZpbGw9IiM2NzNhYjciPjwvcGF0aD48L3N2Zz48L3N2Zz4=',
                    height: 30,
                    width: 20,
                    yoffset: 15,
                }),
                visualVariables: [this._sizeVisualVariable],
            }),
        });
        assetLayer.popupTemplate = new PopupTemplate({
            outFields: ['*'],
            title: '{name}',
        });

        // reactiveUtils.watch(
        //     () => this._webMap.popup.selectedFeature,
        //     (newValue) => {
        //         if (!newValue) {
        //             // Do not execute the callback
        //             return;
        //         }
        //         if (newValue.isAggregate) {
        //             // this._webMap.popup.triggerAction(1);
        //         }
        //     }
        // );

        return assetLayer;
    }


    private _getLayerById(layer: string): FeatureLayer {
        return this._webMap?.map.layers.find(
            ({ id }) => id === layer.toString()
        ) as FeatureLayer;
    }

    /**
     * Display assets pinpoints and clusters
     */
    public async displayAssets(assets: Asset[]) {
        assets = assets.filter(
            asset => !isNaN(+asset?.lng) && !isNaN(+asset?.lat)
        );
        const layer = this._getLayerById('assets');
        reactiveUtils.whenOnce(
            () => this._webMap.map.basemap.initialized
        ).then(() => {
            layer.applyEdits({
                addFeatures: assets.map(
                    asset => new Graphic({
                        geometry: new Point({
                            x: asset.lng,
                            y: asset.lat,
                        }),
                        attributes: asset,
                    })
                ),
            });
        });
    }

}
