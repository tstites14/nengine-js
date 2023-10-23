import { RawBounds } from '../bounds';
import * as random from '../random';
import { Particle } from './particle';

export class Explosive extends RawBounds {
    #particles: Particle[];
    #active: Particle[];
    #minVelocity: number;
    #maxVelocity: number;
    #minAngle: number;
    #maxAngle: number;
    #minLife: number;
    #maxLife: number;
    #density: number; // How many particles to emit per 10ms
    #duration: number; // How long to emit for

    constructor(particles: Particle[]) {
        super(0, 0);
        this.#particles = particles;
        this.#active = new Array(particles.length);
    }
    /** Sets the velocity range for the emitted particles */
    setVelocity(min: number, max: number) {
        this.#minVelocity = min;
        this.#maxVelocity = max;
    }
    /** Sets the angle range for the emitted particles (in radians) */
    setAngle(min: number, max: number) {
        this.#minAngle = min;
        this.#maxAngle = max;
    }
    /** Sets the liftime range for the emitted particles */
    setLife(min: number, max: number) {
        this.#minLife = min;
        this.#maxLife = max;
    }
    /** Sets the density of emitted particles */
    setDensity(density: number) {
        this.#density = density;
    }
    /** Gets the current active particles from the emitter */
    particles(): Particle[] {
        return this.#active;
    }
    /** Starts the emitter */
    start(duration: number) {
        this.#duration = duration;
    }
    /** Removes a particle from the active particles */
    #remove(particle: Particle) {
        for (const [i, p] of this.#active.entries()) {
            if (p === particle) {
                particle.despawn();
                this.#active.splice(i, 1);
                return;
            }
        }
    }
    /** Updates the state of the emitter. Call this every frame */
    update(delta: number) {
        this.#duration -= delta;
        if (this.#duration <= 0) this.#duration = 0;
        let desired = (delta / 10) * this.#density;
        for (const particle of this.#particles) {
            if (particle.duration() > 0) {
                particle.update(delta)
                if (particle.duration() <= 0) {
                    this.#remove(particle);
                }
            } else {
                if (desired > 0 && this.#duration > 0) {
                    particle.xy(...this.xy());
                    particle.setDuration(random.intn(this.#maxLife - this.#minLife) + this.#minLife)
                    particle.setVelocity(
                        random.floatn(this.#maxAngle - this.#minAngle) + this.#minAngle,
                        random.floatn(this.#maxVelocity - this.#minVelocity) + this.#minVelocity,
                    )
                    particle.spawn()
                    for (const [i, active] of this.#active.entries()) {
                        if (!active) this.#active[i] = particle;
                    }
                    desired -= 1
                }
            }
        }
    }
}