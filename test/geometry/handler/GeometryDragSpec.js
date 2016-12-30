import {
    commonSetupMap,
    removeContainer,
    genAllTypeGeometries
} from '../SpecCommon';
import Coordinate from 'geo/Coordinate';
import {
    getPagePosition
} from 'core/util/dom';
import {
    Marker,
    Sector,
    GeometryCollection
} from 'geometry';
import Point from 'geo/Point';
import VectorLayer from 'layer/VectorLayer';

describe('#GeometryDrag', function () {
    var container, eventContainer;
    var map;
    var center = new Coordinate(118.846825, 32.046534);

    function dragGeometry(geometry, isMove) {
        map.removeLayer('id');
        var layer = new VectorLayer('id');
        map.addLayer(layer);

        geometry.addTo(layer);
        var spy = sinon.spy();
        geometry.on('mousedown', spy);

        var domPosition = getPagePosition(container);
        var point = map.coordinateToContainerPoint(geometry.getFirstCoordinate()).add(domPosition);
        // var requestAnimFn = requestAnimFrame;

        happen.mousedown(eventContainer, {
            'clientX': point.x,
            'clientY': point.y
        });
        expect(spy.called).to.be.ok();
        if (isMove === undefined || isMove) {
            for (var i = 0; i < 10; i++) {
                happen.mousemove(document, {
                    'clientX': point.x + i,
                    'clientY': point.y + i
                });
            }
        }
        happen.mouseup(document);
    }

    function dragMap() {
        var domPosition = getPagePosition(container);
        var point = map.coordinateToContainerPoint(map.getCenter()).add(domPosition).add(new Point(30, 20));
        happen.mousedown(eventContainer, {
            'clientX': point.x,
            'clientY': point.y
        });
        for (var i = 0; i < 10; i++) {
            happen.mousemove(document, {
                'clientX': point.x + i,
                'clientY': point.y + i
            });
        }
        happen.mouseup(document);
    }

    beforeEach(function () {
        var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
        map.config('panAnimation', false);
        eventContainer = map._panels.canvasContainer;
    });

    afterEach(function () {
        removeContainer(container);
    });
    describe('drag geometries', function () {
        it('in default, geometries cannot be dragged', function () {
            var marker = new Marker(center);
            dragGeometry(marker);
            expect(marker.getCoordinates()).to.be.closeTo(center);
        });

        it('can drag a default marker', function () {
            var marker = new Marker(center, {
                draggable: true
            });
            dragGeometry(marker);
            expect(marker.getCoordinates()).not.to.be.eql(center);
        });

        it('drag all kinds of geometries', function () {
            this.timeout(8000);
            var geometries = genAllTypeGeometries();

            for (var i = 0; i < geometries.length; i++) {
                var geo = geometries[i];
                if (geo instanceof GeometryCollection || geo instanceof Sector) {
                    //not fit for geometry collection's test.
                    continue;
                }
                geo.config('draggable', true);
                var center = geo.getCenter();
                dragGeometry(geo);
                expect(geo.getCenter()).not.to.closeTo(center);
            }
        });

        it('enable map draggable after dragging', function () {
            var center = map.getCenter();
            var marker = new Marker(center, {
                draggable: true
            });
            dragGeometry(marker);
            dragMap();
            expect(map.getCenter()).not.to.closeTo(center);
        });

        it('enable map draggable after dragging without moving', function () {
            var center = map.getCenter();
            var marker = new Marker(center, {
                draggable: true
            });
            dragGeometry(marker, false);
            dragMap();
            expect(map.getCenter()).not.to.closeTo(center);
        });
    });

    describe('drag can be disable', function () {
        it('disables dragging', function () {
            var marker = new Marker(center, {
                draggable: false
            });
            dragGeometry(marker);
            expect(marker.getCoordinates()).to.be.closeTo(center);
        });
    });

});
