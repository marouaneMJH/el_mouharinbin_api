import { RpcException } from '@nestjs/microservices';

export function RpcCatch(): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await original.apply(this, args);
      } catch (e) {
        throw new RpcException(e);
      }
    };

    return descriptor;
  };
}
